import clsx from "clsx";

type Props = React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "p" | "span";
    size?: "2xl" | "xl" | "lg" | "md" | "sm";
    weight?: "regular" | "medium" | "bold";
};

export default function Typography({
    as: Tag = "p",
    size = "md",
    weight = "regular",
    className,
    ...props
}: Props) {
    const sizes = {
        "2xl": "text-3xl md:text-4xl",
        xl: "text-2xl",
        lg: "text-xl",
        md: "text-base",
        sm: "text-sm",
    };

    const weights = {
        regular: "font-normal",
        medium: "font-medium",
        bold: "font-bold",
    };

    return <Tag className={clsx(sizes[size], weights[weight], className)} {...props} />;
}