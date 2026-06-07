import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('equipment')
export class Equipment {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  site: string;

  @PrimaryColumn({ type: 'varchar', length: 255 })
  equipment: string;

  @Column({ name: 'meas_id', type: 'int' })
  measId: number;

  @Column({ name: 'meas_point', type: 'varchar', length: 100, nullable: true })
  measPoint: string;

  @Column({ name: 'meas_date', type: 'date' })
  measDate: Date | string;

  @Column({ type: 'tinyint', nullable: true })
  state: number;

  @Column({ name: 'is_f_motor', type: 'boolean', default: false })
  isFMotor: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}