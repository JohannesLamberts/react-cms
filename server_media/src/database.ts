import {
    Db,
    GridFSBucket
}                      from 'mongodb';
import { MEDIA_ENV }   from './env';
import { MediaServer } from './environment';

const { name, auth } = MEDIA_ENV.db;
const Client = MediaServer.connectMongoDb({ auth });

let Database: Db;

export default (): Promise<void> => {
    return Client.connect()
                 .then(() => {
                     Database = Client.db(name);
                 });
};

export const getCollection = (collectionName: string) => {
    return Database.collection(collectionName);
};

export const getFsBucket = (): GridFSBucket => {
    return new GridFSBucket(Database);
};