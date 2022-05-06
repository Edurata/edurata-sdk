export const logLevels = {
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    ALERT: "ALERT",
}

export const log = (message: string, logLevel = logLevels.DEBUG, stage): void => {
    const prependMessage = stage ? `During ${stage}` : ""
    const logMessage = `${logLevel}: ${prependMessage} ${message}` 
    console.log(logMessage)
}
