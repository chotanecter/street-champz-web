import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import classes from "./navbar.module.css";
import type { ReactNode } from "react";
import { Gamepad2, Trophy, User, ShoppingBag, Target } from "lucide-react";

interface NavLink {
    nameKey: string;
    icon: ReactNode;
    path: string;
}

const LINKS: NavLink[] = [
    {
        nameKey: "nav.play",
        path: "/",
        icon: <Gamepad2 />
    },
    {
        nameKey: "nav.leaderboard",
        path: "/leaderboard",
        icon: <Trophy />
    },
    {
        nameKey: "nav.missions",
        path: "/missions",
        icon: <Target />
    },
    {
        nameKey: "nav.shop",
        path: "/shop",
        icon: <ShoppingBag />
    },
    {
        nameKey: "nav.profile",
        path: "/profile",
        icon: <User />
    },
];

export function Navbar() {
    const [location] = useLocation();
    const { t } = useTranslation();

    return (
        <div className={classes.root}>
            {LINKS.map(link => (
                <Link
                    key={`link-${link.path}`}
                    to={link.path}
                    className={classes.link}
                    data-active={location === link.path}
                >
                    {link.icon}

                    <span>
                        {t(link.nameKey)}
                    </span>
                </Link>
            ))}
        </div>
    );
}
