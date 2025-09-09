const tailwind_colors: Array<string> = [
    'DC2626',
    'EA580C',
    'D97706',
    'C026D3',
    '9333EA',
    'CA8A04',
    '65A30D',
    '16A34A',
    '059669',
    '2563EB',
    '9333EA',
    'E11D48',
    '0284C7',
];

export const strokeColor = (line_index: number): string => {
    return tailwind_colors[line_index % tailwind_colors.length];
};
