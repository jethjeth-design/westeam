export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-warmbeige text-champagnegold shadow-sm focus:ring-champagnegold ' +
                className
            }
        />
    );
}
