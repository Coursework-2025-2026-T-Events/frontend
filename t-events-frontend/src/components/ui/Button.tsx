import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonBaseProps = {
    variant?: "primary" | "secondary";
    className?: string;
};

type ButtonAsButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
};

type ButtonAsLinkProps = ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps & {
    href: string;
};

type Props = ButtonAsButtonProps | ButtonAsLinkProps;

function isLinkProps(props: Props): props is ButtonAsLinkProps {
    return "href" in props && props.href !== undefined;
}

function omitKeys<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
    const next = { ...obj } as T;
    for (const key of keys) {
        delete next[key];
    }
    return next as Omit<T, K>;
}

export default function Button(props: Props) {
    const variant = props.variant ?? "primary";
    const className = props.className;
    const base =
        "inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50";
    const styles =
        variant === "primary"
            ? "bg-[var(--color-brand-yellow)] text-[var(--color-brand-black)] hover:opacity-90"
            : "border border-[var(--color-brand-black)] text-[var(--color-brand-black)] hover:bg-[var(--color-brand-yellow)]";

    if (isLinkProps(props)) {
        const { href } = props;
        const linkRest = omitKeys(props, ["href", "variant", "className"] as const);
        return <Link href={href} className={clsx(base, styles, className)} {...linkRest} />;
    }

    const buttonRest = omitKeys(props, ["variant", "className"] as const);
    return <button className={clsx(base, styles, className)} {...buttonRest} />;
}