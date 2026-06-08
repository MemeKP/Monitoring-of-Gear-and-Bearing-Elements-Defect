import { commaSeparatedToArray } from "src/helpers/transformer.helper";
import { Report } from "src/report/entities/report.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('enveloped_fft')
export class Measurement {

    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @Column({ type: 'varchar', length: 10 })
    site: string;

    @Column({ type: 'varchar', length: 150 })
    equipment: string;

    @Column({ type: 'varchar', length: 50, name: 'meas_point' })
    measPoint: string;

    @Column({ type: 'varchar', length: 255, name: 'meas_point_mod' })
    measPointMod: string;

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

    @Column({ type: 'varchar', length: 500, name: 'env_fft_model_1', nullable: true })
    envFftModel1: string | null;

    @Column({ type: 'varchar', length: 500, name: 'env_fft_model_2', nullable: true })
    envFftModel2: string | null;

    @Column({ type: 'varchar', length: 255, name: 'model_class_1', nullable: true })
    modelClass1: string | null;

    @Column({ type: 'varchar', length: 255, name: 'model_class_2', nullable: true })
    modelClass2: string | null;

    @Column({ type: 'varchar', length: 255, name: 'trainer', nullable: true })
    trainer: string | null;

    @Column({ type: 'varchar', length: 255, name: 'tested_env_fft_model_1', nullable: true })
    testedEnvFftModel1: string | null;

    @Column({ type: 'varchar', length: 255, name: 'tested_env_fft_model_2', nullable: true })
    testedEnvFftModel2: string | null;

    @Column({ type: 'varchar', length: 255, name: 'tested_model_class_1', nullable: true })
    testedModelClass1: string | null;

    @Column({ type: 'tinyint', name: 'tested_accuracy_1', nullable: true })
    testedAccuracy1: number | null;

    @Column({ type: 'varchar', length: 255, name: 'tested_model_class_2', nullable: true })
    testedModelClass2: string | null;

    @Column({ type: 'tinyint', name: 'tested_accuracy_2', nullable: true })
    testedAccuracy2: number | null;

    @Column({ type: 'varchar', length: 255, name: 'final_model_class', nullable: true })
    finalModelClass: string | null;

    @Column({ type: 'tinyint', name: 'final_accuracy', nullable: true })
    finalAccuracy: number | null;

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

    @Column({ type: 'longtext',  nullable: true })
    pic: string | null;

    @Column({ type: 'varchar', length: 50, name: 'seq_id', nullable: true })
    seqId: string | null;

    @Column({ type: 'json', name: 'scales', nullable: true })
    scales: number[] | null;

    @Column({ type: 'varchar', length: 10, name: 'indicator', nullable: true })
    indicator: string | null;

    @Column({ type: 'datetime', name: 'when_actioned', nullable: true })
    whenAction: Date | null;

    @OneToOne(() => Report, (report) => report.measurement)
    report: Report | null;
}