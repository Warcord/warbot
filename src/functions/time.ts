const time = (time: number): { hour: number, min: number, seconds: number } => {

    let timeSeconds = Math.floor(time / 1000)
    timeSeconds %= 86400;

    const hour = Math.floor(timeSeconds / 3600);
    timeSeconds %= 3600;

    const minFormated = (timeSeconds / 60);
    const min = Math.floor(minFormated)
    const seconds = (timeSeconds % 60);

    const timeObj = {
        hour: hour,
        min: min,
        seconds: seconds
    }

    return timeObj;
}

export { time }