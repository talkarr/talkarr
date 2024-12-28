import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Media {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column({ unique: true })
    uuid!: string;
}
