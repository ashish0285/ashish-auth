import { winstonLogger } from '@ashish0285/ashish-job-shared';
import { config } from '@auth/config';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@auth/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug');

export const publishDirectMessage = async (
    channel: Channel| undefined,
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
): Promise<void> => {
    try {
        while (!channel) {
            channel = await createConnection();
          }
          await channel.assertExchange(exchangeName, 'direct');
          channel.publish(exchangeName,routingKey, Buffer.from(message));
          log.info(logMessage);
    } catch (error) {
        log.log('error', 'AuthService EmailConsumer publishDirectMessage() method:', error);
    }

};