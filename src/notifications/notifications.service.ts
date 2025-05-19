import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async sendBookingNotification(bookingId: string, inTime?: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: true,
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Бронювання з ID ${bookingId} не знайдено`);
    }

    let notificationTime: Date;

    if (inTime !== undefined) {
      notificationTime = new Date(booking.startTime);
      notificationTime.setMinutes(notificationTime.getMinutes() - inTime);
    } else {
      notificationTime = new Date(booking.startTime);
    }

    this.logger.log(
      `Планування сповіщення для користувача ${booking.user.email} для комнати ${booking.room.name} на ${notificationTime.toISOString()}`,
    );

    return {
      message: `Сповіщення заплановано на ${notificationTime.toISOString()}`,
      user: booking.user.email,
      room: booking.room.name,
      startTime: booking.startTime,
    };
  }

  private async sendEmail(email: string, subject: string, content: string) {
    this.logger.log(`Відправлення електронної пошти на адресу ${email}`);
    this.logger.log(`Тема: ${subject}`);
    this.logger.log(`Вміст: ${content}`);

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.example.com',
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER || 'user@example.com',
          pass: process.env.MAIL_PASSWORD || 'password',
        },
      });

      const mailOptions = {
        from:
          process.env.MAIL_FROM || 'Room Booking <no-reply@roombooking.com>',
        to: email,
        subject: subject,
        text: content,
        html: content.replace(/\n/g, '<br>'),
      };

      const info = await transporter.sendMail(mailOptions);
      this.logger.log(`Email відправлено: ${info.messageId}`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Помилка відправки email: ${errorMessage}`, errorStack);
      return false;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendReminderNotifications() {
    this.logger.log('Перевірка бронювань для відправки нагадувань');

    const now = new Date();
    const reminderTime = new Date(now.getTime() + 15 * 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        startTime: {
          gt: now,
          lte: reminderTime,
        },
      },
      include: {
        user: true,
        room: true,
      },
    });

    this.logger.log(`Знайдено ${bookings.length} бронювань для нагадування`);

    for (const booking of bookings) {
      const startTimeFormatted = booking.startTime.toLocaleString('uk-UA');
      const subject = `Нагадування про зустріч у кімнаті ${booking.room.name}`;
      const content = `Шановний(-а) ${booking.user.name}!\n\nНагадуємо, що через 15 хвилин, о ${startTimeFormatted}, у вас заплановано зустріч у кімнаті ${booking.room.name}.\n\nЗ повагою, Система бронювання кімнат.`;

      await this.sendEmail(booking.user.email, subject, content);
      this.logger.log(
        `Відправлено нагадування для користувача ${booking.user.email} про зустріч у кімнаті ${booking.room.name}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendStartNotifications() {
    this.logger.log('Перевірка бронювань для відправки сповіщень про початок');

    const now = new Date();
    const startTime = new Date(now.getTime() - 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        startTime: {
          gte: startTime,
          lte: now,
        },
      },
      include: {
        user: true,
        room: true,
      },
    });

    this.logger.log(
      `Знайдено ${bookings.length} бронювань для сповіщення про початок`,
    );

    for (const booking of bookings) {
      const meetingStartTime = booking.startTime.toLocaleString('uk-UA');
      const subject = `Початок зустрічі у кімнаті ${booking.room.name}`;
      const content = `Шановний(-а) ${booking.user.name}!\n\nВаша зустріч у кімнаті ${booking.room.name} почалася о ${meetingStartTime}.\n\nЗ повагою, Система бронювання кімнат.`;

      await this.sendEmail(booking.user.email, subject, content);
      this.logger.log(
        `Відправлено сповіщення про початок зустрічі для користувача ${booking.user.email} у кімнаті ${booking.room.name}`,
      );
    }
  }
}
