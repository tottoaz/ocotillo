import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduledTaskDto } from './dto/create-scheduled-task.dto';
import { UpdateScheduledTaskDto } from './dto/update-scheduled-task.dto';
import { ScheduledTask } from './entities/scheduled-task.entity';
import { Repository, UpdateResult } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Activity } from 'src/activities/entities/activity.entity';

@Injectable()
export class ScheduledTaskService {
  constructor(
    @InjectRepository(ScheduledTask)
    private scheduledTaskRepository: Repository<ScheduledTask>,
  ) {}

  create(createScheduledTaskDto: CreateScheduledTaskDto) {
    return this.scheduledTaskRepository.save(createScheduledTaskDto);
  }

  async findAll(userId: number): Promise<ScheduledTask[]> {
    const tasks = await this.scheduledTaskRepository.find({
      where: {
        user_id: userId,
      },
    });

    return tasks;
  }

  async findAllByPlant(
    userId: number,
    plantId: number,
  ): Promise<ScheduledTask[]> {
    const tasks = await this.scheduledTaskRepository.find({
      where: {
        user_id: userId,
        plant_id: plantId,
      },
      relations: ['activityType'],
    });

    return tasks;
  }

  @OnEvent('activity.created', { async: true })
  async handleActivityCreatedEvent(payload) {
    this.scheduledTaskRepository.update(
      {
        user_id: payload.activity.user_id,
        activity_type_id: payload.activity.type_id,
        plant_id: payload.activity.plant_id,
      },
      {
        last_completed_at: payload.activity.performed_at,
      },
    );
  }

  async findAllCurrent(
    userId: number,
    plantId: number,
  ): Promise<ScheduledTask[]> {
    //TODO implement logic to find current and overdue tasks
    const tasks = await this.scheduledTaskRepository.find({
      where: {
        user_id: userId,
        plant_id: plantId,
      },
      relations: ['activityType'],
    });

    return tasks;
  }

  async findOne(id: number): Promise<ScheduledTask> {
    const task = await this.scheduledTaskRepository.findOne(id);

    return task;
  }

  async update(
    id: number,
    updateScheduledTaskDto: UpdateScheduledTaskDto,
  ): Promise<UpdateResult> {
    const task = await this.scheduledTaskRepository.update(
      id,
      updateScheduledTaskDto,
    );

    return task;
  }

  async remove(id: number): Promise<any> {
    const deletedTask = await this.scheduledTaskRepository.delete({
      id: id,
    });

    return deletedTask;
  }
}
