import {
    Request,
    Response
}                      from 'express';
import * as fs         from 'fs';
import * as multer     from 'multer';
import * as path       from 'path';
import { ApiSegment }  from 'server-modules';
import { EHttpState }  from 'server-modules/build/modules/express/httpState';
import { getFsBucket } from './database';
import { MEDIA_ENV }   from './env';
import { MediaServer } from './environment';

const upload = multer({ dest: '_tmp_file_update' }).single('file');

const UploadAPI: ApiSegment = new ApiSegment('upload');

const writeFile = (req: Request, res: Response) => {
    const file: Express.Multer.File = req.file;
    const parsedFileName = path.parse(file.originalname);

    const stream = getFsBucket()
        .openUploadStream(parsedFileName.base,
                          {
                              contentType: file.mimetype,
                              metadata: {
                                  tags: []
                              }
                          });

    fs.createReadStream(file.path)
      .pipe(stream)
      .on('error', () => {
          res.sendStatus(EHttpState.eServerError);
          fs.unlink(file.path, () => null);
      })
      .on('finish', () => {
          res.json({ id: stream.id })
             .status(EHttpState.eOk);
          fs.unlink(file.path, () => null);
      });
};

UploadAPI.addRoute('')
         .post(upload,
               (req, res) => {
                   writeFile(req, res);
               });

UploadAPI.addRoute<{ file_id: string }>('/:file_id')
         .put(upload,
              (req, res) => {
                  getFsBucket()
                      .delete(
                          req.params.id,
                          err => {
                              if (err) {
                                  res.sendStatus(EHttpState.eServerError);
                                  return;
                              }
                              writeFile(req, res);
                          });
              });

export default () => {
    MediaServer
        .createExpress(
            {
                port: MEDIA_ENV.port_modify,
                init: app => {
                    // TODO: authenticate
                    UploadAPI.registerOn(MediaServer.logger, app);
                }
            });
};