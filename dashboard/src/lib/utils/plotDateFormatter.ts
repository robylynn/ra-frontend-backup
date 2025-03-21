export const plotDateFormatter = (timestamp: number) => {
    let date = new Date(timestamp * 1000.0);
    let formatted_date = date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    return formatted_date;
};
