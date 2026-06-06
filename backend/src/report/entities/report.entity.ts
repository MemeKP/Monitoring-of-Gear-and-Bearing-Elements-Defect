import { Measurement } from "src/measurements/entities/measurement.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('reports')
export class Report {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'enveloped_fft_id',
  })
  envelopedFftId: string;

  @OneToOne(() => Measurement)
  @JoinColumn({ name: 'enveloped_fft_id' })
  measurement: Measurement;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kks: string | null;

  @Column({ type: 'varchar', length: 255, name: 'equipment_name', nullable: true })
  equipmentName: string | null;

  @Column({ type: 'float', nullable: true })
  rpm: number | null;

  @Column({ type: 'json', name: 'bearings', nullable: true })
  bearings: {
    bearingNo: string;
    pointBrg: string;
    bpfo: number;
    bpfi: number;
    bsf: number;
  }[] | null;

  @Column({ type: 'text', nullable: true })
  findings: string | null;

  @Column({ type: 'text', nullable: true })
  recommendations: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}