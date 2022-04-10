function leadZero(num: number) {
    return num > 9 ? num : '0' + num;
}

export function secsToHMS(value:  number) {
    const hours = Math.floor(value / 3600);
    const mins = Math.floor((value - hours * 3600) / 60);
    const secs = Math.floor(value - hours * 3600 - mins * 60);

    return [hours, leadZero(mins), leadZero(secs)].join(':');
}
