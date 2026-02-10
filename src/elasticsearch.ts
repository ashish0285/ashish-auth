import { Client } from '@elastic/elasticsearch';
import { ISellerGig, winstonLogger } from '@ashish0285/ashish-job-shared';
import { Logger } from 'winston';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@auth/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');

export const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

export const checkConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`AuthService ElasticSearch Health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to ElasticSearch failed. Retrying....');
      log.log('error', 'Auth Service checkConnection() method:', error);
    }
  }
};

const checkIfIndexExists = async(indexName: string): Promise<boolean> => {
  const result: boolean = await  elasticSearchClient.indices.exists({index: indexName});
  return result;
};

export const createIndex = async(indexName: string): Promise<void> => {
  try {
    const result: boolean = await checkIfIndexExists(indexName);
    if (result) {
      log.info(`Index "${indexName}" already exists`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName});
      await elasticSearchClient.indices.refresh({ index: indexName});
      log.info(`Created Index "${indexName}"`);
    }
    
  } catch (error) {
    log.error(`An error occured while creating the index ${indexName}`);
      log.log('error', 'Auth Service createIndex() method:', error);
  }
};

export const getDocumentById = async(index: string, gigId: string): Promise<ISellerGig> => {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: gigId
    });
    return result._source as ISellerGig;
    
  } catch (error) {
    log.log('error', 'AuthService elasticSearch getDocumentById() method:', error);
    return {} as ISellerGig;
  }
};