/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis, { type Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: RedisClient;

  onModuleInit(): void {
    this.client = new Redis({
      host: process.env['REDIS_HOST'] ?? 'localhost',
      port: Number(process.env['REDIS_PORT'] ?? 6379),
      password: process.env['REDIS_PASSWORD'] ?? undefined,
    });

    this.client.on('error', (err: Error) => {
      console.error('Redis error:', err.message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, mode?: 'EX', duration?: number): Promise<void> {
    if (mode === 'EX' && duration) {
      await this.client.set(key, value, 'EX', duration);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Convert Object
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) as T : null;
  }

  // Object to String Redis
  async setJson(key: string, value: any, durationInSeconds?: number): Promise<void> {
    const strValue = JSON.stringify(value);
    if (durationInSeconds) {
      await this.client.set(key, strValue, 'EX', durationInSeconds);
    } else {
      await this.client.set(key, strValue);
    }
  }
}