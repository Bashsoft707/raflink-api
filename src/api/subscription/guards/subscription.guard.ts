import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionService } from '../services/subscription.service';
import { SubscriptionStatus } from '../../../constants';

@Injectable()
export class ProSubscriptionGuard implements CanActivate {
  constructor(private subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return false;
    }

    const subscription =
      await this.subscriptionService.getUserSubscription(userId);

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ForbiddenException(
        'This feature requires an active Pro subscription',
      );
    }

    return true;
  }
}
