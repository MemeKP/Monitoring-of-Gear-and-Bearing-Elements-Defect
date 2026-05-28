import { commaSeparatedToArray } from "src/helpers/transformer.helper";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('enveloped_fft')
export class Measurement {

    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 100 })
    site: string;

    @Column({ type: 'varchar', length: 255 })
    equipment: string;

    @Column({ type: 'varchar', length: 50, name: 'meas_point' })
    measPoint: string;

    @Column({ type: 'date', name: 'meas_date' })
    measDate: string;

    @Column({ type: 'time', name: 'meas_time', nullable: true })
    measTime: string | null;

    @Column({ type: 'varchar', length: 50, name: 'amp_type', nullable: true })
    ampType: string | null;

    @Column({ type: 'float', nullable: true })
    df: number | null;

    @Column({ type: 'float', name: 'BPFO', nullable: true })
    bpfo: number | null;

    @Column({ type: 'float', nullable: true })
    f0: number | null;

    @Column({ type: 'float', nullable: true })
    ibeta: number | null;

    @Column({ type: 'json', name: 'enveloped_fft', nullable: true })
    envelopedFft: number[][] | null;

    @Column({
        type: 'varchar',
        length: 255,
        name: 'detail_peak',
        nullable: true,
        transformer: commaSeparatedToArray
    })
    detailPeak!: number[] | null;

@Column({ type: 'float', name: 'opt_point_value', nullable: true })
optPointValue: number | null;

@Column({ type: 'float', name: 'adj_opt_point_value', nullable: true })
adjOptPointValue: number | null;

@Column({ type: 'tinyint', nullable: true })
state: number | null;

@Column({ type: 'json', name: 'peaks_data', nullable: true })
peakData: object[] | null;

@Column({ type: 'varchar', length: 500, nullable: true })
pic: string | null;

@Column({ type: 'int', name: 'seq_id', nullable: true })
seqId: number | null;

@Column({ type: 'float', nullable: true })
scales: number | null;

@Column({ type: 'datetime', name: 'when_actioned', nullable: true })
whenAction: Date | null;
}