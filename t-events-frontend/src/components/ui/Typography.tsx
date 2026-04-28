import clsx from "clsx";
import type { ElementType, ComponentPropsWithoutRef } from "react";

type TypographyOwnProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  size?: "2xl" | "xl" | "lg" | "md" | "sm";
  weight?: "regular" | "medium" | "bold";
  className?: string;
};

type TypographyProps<T extends ElementType> = TypographyOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof TypographyOwnProps> & {
    as?: T;
  };

export default function Typography<T extends ElementType = "p">({
  as,
  size = "md",
  weight = "regular",
  className,
  ...props
}: TypographyProps<T>) {
  const Tag = (as ?? "p") as ElementType;
  const sizes = {
    "2xl": "text-2xl md:text-3xl",
    xl: "text-xl md:text-2xl",
    lg: "text-lg",
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
