import winston, {format} from 'winston'
import WinstonCloudWatch from 'winston-cloudwatch'
const logFilePath = "logs/combined.log" 
const errorFilePath = "logs/error.log"

export class Logger {
    wLogger;
    IS_LAMBDA;
    
    constructor(logGroup, logStream) {
        this.IS_LAMBDA = !!process.env.LAMBDA_TASK_ROOT
        if (logGroup && logStream) {
            this._init(logGroup, logStream)
        } else {
            const EDU_LOG_GROUP = process.env.EDU_LOG_GROUP
            const EDU_LOG_STREAM = process.env.EDU_LOG_STREAM
            this._init(EDU_LOG_GROUP, EDU_LOG_STREAM)
        }

    }

    _init(logGroup, logStream) {
        let transports: any = []
        if (!logGroup || !logStream) {
            throw Error("Can't initialise logger as logGroup or logStream are not defined")
        }
        transports.push(new WinstonCloudWatch({
            name: 'winston-cloudwatch',
            logGroupName: logGroup,
            logStreamName: logStream,
            awsRegion: 'eu-central-1',
            jsonMessage: true
        }))
        if (!this.IS_LAMBDA) {
            transports.push(
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(info => `${new Date().toISOString()} ${info.level}: ${JSON.stringify(info.message)}`),
                    )
                }),
                new winston.transports.File({ filename: errorFilePath, level: 'error' }),
                new winston.transports.File({ 
                    level: 'debug',
                    filename: logFilePath,
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            )
        }
        this.wLogger = winston.createLogger({
            levels: winston.config.syslog.levels,
            defaultMeta: {},
            transports,
        });
    }

    flush = () => {
        if (this.wLogger) {
            const cwTransport = this.wLogger.transports.find((t) => t.name === 'winston-cloudwatch')
            if (cwTransport) {
                cwTransport.kthxbye(()=> {});
            }
        }
    }

    debug = (message) => {
        this.wLogger.debug(message)
    }

    info = (message) => {
        this.wLogger.info(message)
    }

    warning = (message) => {
        this.wLogger.warning(message)
    }

    error = (message) => {
        this.wLogger.error(message)
    }

    alert = (message) => {
        this.wLogger.alert(message)
    }
}

export const logger = new Logger(undefined, undefined)
