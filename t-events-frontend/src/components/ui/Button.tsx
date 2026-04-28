import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonBaseProps = {
    variant?: "primary" | "secondary" | "dark" | "danger" | "ghost";
    className?: string;
};

type ButtonAsButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
};

type ButtonAsLinkProps = ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps & {
    href: string;
    reloadDocument?: boolean;
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
        "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-semibold transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-black)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50";
    const styles = {
        primary: "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)] shadow-[0_2px_0_rgba(16,17,20,0.08)] hover:bg-[var(--color-brand-yellow-hover)] active:translate-y-px",
        secondary: "border border-[var(--color-brand-line)] bg-white text-[var(--color-brand-ink)] hover:border-neutral-300 hover:bg-[var(--color-brand-panel)]",
        dark: "bg-[var(--color-brand-ink)] text-white shadow-[0_2px_0_rgba(16,17,20,0.16)] hover:bg-[var(--color-brand-graphite)] active:translate-y-px",
        danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        ghost: "bg-transparent text-[var(--color-brand-graphite)] hover:bg-[var(--color-brand-panel)]",
    }[variant];

    if (isLinkProps(props)) {
        const { href, reloadDocument } = props;
        const linkRest = omitKeys(props, ["href", "variant", "className", "reloadDocument"] as const);
        if (reloadDocument) {
            return <a href={href} className={clsx(base, styles, className)} {...linkRest} />;
        }
        return <Link href={href} className={clsx(base, styles, className)} {...linkRest} />;
    }

    const buttonRest = omitKeys(props, ["variant", "className"] as const);
    return <button className={clsx(base, styles, className)} {...buttonRest} />;
}
