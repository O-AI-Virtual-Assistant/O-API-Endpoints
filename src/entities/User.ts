import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    name: string;

    @Column('text', {unique: true})
    githubId: string;

    @Column('text')
    userImg: string;

    @Column('text', {nullable: true})
    description: string;
}

