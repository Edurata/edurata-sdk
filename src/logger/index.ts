import winston, {format} from 'winston'
import WinstonCloudWatch from 'winston-cloudwatch'
const logFilePath = "logs/combined.log" 
const errorFilePath = "logs/error.log"

export class Logger {
    wLogger;
    withCw = false;
    
    constructor() {
        const EDU_LOG_GROUP = process.env.EDU_LOG_GROUP
        const EDU_LOG_STREAM = process.env.EDU_LOG_STREAM
        let transports: any = [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(info => `${new Date().toISOString()} ${info.level}: ${JSON.stringify(info.message)}`),
                )
            }),
            new winston.transports.File({ filename: errorFilePath, level: 'error' }),
            new winston.transports.File({ 
                filename: logFilePath,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                )
            })
        ]
        if (EDU_LOG_GROUP && EDU_LOG_STREAM) {
            this.withCw = true
            console.log(`Using remote log ${EDU_LOG_GROUP} and ${EDU_LOG_STREAM}`)
            transports.push(new WinstonCloudWatch({
                name: 'winston-cloudwatch',
                logGroupName: EDU_LOG_GROUP,
                logStreamName: EDU_LOG_STREAM,
                awsRegion: 'eu-central-1',
                jsonMessage: true
            }))
        }
        this.wLogger = winston.createLogger({
            levels: winston.config.syslog.levels,
            defaultMeta: {},
            transports,
        });

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

    flush = () => {
        if (this.withCw) {
            const cwTransport = this.wLogger.transports.find((t) => t.name === 'winston-cloudwatch')
            cwTransport.kthxbye();
        }
    }
}

export const logger = new Logger()