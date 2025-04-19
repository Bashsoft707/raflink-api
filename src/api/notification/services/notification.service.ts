import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { errorHandler } from '../../../utils';
import { Notification, NotificationDocument } from '../schema';
import { UpdateNotificationDto, NotificationFilterDTO } from '../dto';
import { AuthService } from 'src/api/authentication/services/authentication.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly NotificationModel: Model<NotificationDocument>,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  async updateUserNotification(
    id: Types.ObjectId,
    type: string,
    dto: UpdateNotificationDto,
  ) {
    try {
      const user = await this.authService.getUserType(id, type);

      const query =
        type === 'user' ? { userId: user._id } : { merchantId: user._id };

      const userNotification = await this.NotificationModel.findOneAndUpdate(
        query,
        {
          ...dto,
          userId: type === 'user' ? user._id : null,
          merchantId: type === 'merchant' ? user._id : null,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      ).exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User notification preferences updated successfully.',
        data: userNotification,
        error: null,
      };
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getUserNotificationSettings(id: Types.ObjectId, type: string) {
    try {
      const user = await this.authService.getUserType(id, type);
      const query =
        type === 'user' ? { userId: user._id } : { merchantId: user._id };

      const userNotification =
        await this.NotificationModel.findOne(query).exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User notification settings retrieved successfully.',
        data: userNotification,
        error: null,
      };
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getNotifications(query: NotificationFilterDTO) {
    try {
      const { page, limit, startDate, endDate } = query;
      const skip = (page - 1) * limit;

      const baseQuery = {};

      if (startDate) {
        const beginDate = new Date(startDate);
        const FinishDate = new Date(endDate);
        beginDate.setHours(0, 0, 0, 0);
        FinishDate.setHours(23, 59, 59, 999);

        baseQuery['created_at'] = { $gte: beginDate, $lte: FinishDate };
      }

      const [Notifications, count] = await Promise.all([
        this.NotificationModel.find(baseQuery)
          .populate('userId', 'displayName')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.NotificationModel.countDocuments(baseQuery),
      ]);

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Notifications retrieved successfully.',
        data: { Notifications, count, page, pageSize: limit },
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async getSingleNotification(id: string) {
    try {
      const Notification = await this.NotificationModel.findOne(
        { _id: id },
        '-userId',
      ).exec();

      if (!Notification) {
        throw new NotFoundException('Notification record not found');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Single Notification retrieved successfully.',
        data: Notification,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
