import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Measurement } from "src/measurements/entities/measurement.entity";
import { RedisService } from "src/redis/redis.service";
import { Repository } from "typeorm";
import { analyzeSpectrum } from './spectrum-analyzer.helper';

@Injectable()
export class SpectrumCacheService {
    private readonly CACHE_KEY = 'spectrum:true_f_ids';
    private readonly TTL = 60 * 60; // 1 hr

    constructor(
        @InjectRepository(Measurement)
        private readonly repo: Repository<Measurement>,
        private readonly cache: RedisService,
    ) { }

    // startup / cron job
    async warmUp(): Promise<void> {
        const cached = await this.cache.get(this.CACHE_KEY);
        if (cached) return;

        await this.rebuild();
    }

    async rebuild(): Promise<void> {
        const allF6 = await this.repo.find({
            where: { state: 6 },
            select: ['id', 'envelopedFft', 'detailPeak', 'bpfo', 'df'],
        });

        const trueFIds = new Set<number>();
        const uglyIds = new Set<number>();

        for (const m of allF6) {
            const isTrueF = analyzeSpectrum(
                m.envelopedFft, m.detailPeak,
                m.bpfo ? parseFloat(m.bpfo as any) : null,
                m.df ? parseFloat(m.df as any) : null,
            ).isTrueF;

            if (isTrueF) trueFIds.add(m.id);
            else uglyIds.add(m.id);
        }

        await this.cache.set(
            this.CACHE_KEY,
            JSON.stringify({ trueFIds: [...trueFIds], uglyIds: [...uglyIds] }),
            'EX',
            this.TTL,
        );
    }

    async getTrueFIds(): Promise<{ trueFIds: number[]; uglyIds: number[] }> {
        const raw = await this.cache.get(this.CACHE_KEY); 
        if (!raw) {
            await this.rebuild();
            const raw2 = await this.cache.get(this.CACHE_KEY);
            return JSON.parse(raw2!);
        }
        return JSON.parse(raw);
    }
}