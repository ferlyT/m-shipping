export function formatRupiahShort(value: number) {
    const format = (num: number) =>
        num.toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    if (value >= 1_000_000_000) {
        return "Rp " + format(value / 1_000_000_000) + "M";
    }
    if (value >= 1_000_000) {
        return "Rp " + format(value / 1_000_000) + "Jt";
    }
    if (value >= 1_000) {
        return "Rp " + format(value / 1_000) + "Rb";
    }
    return "Rp " + format(value);
}