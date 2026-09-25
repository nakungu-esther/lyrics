import { Link } from "react-router-dom";

import { HubIcon } from "../icons/HubIcon";

import { ICON_SIZE } from "../icons/iconDefaults";

import { APP_NAME } from "../../lib/brand";



type BrandLogoProps = {

  className?: string;

  to?: string;

};



export function BrandLogo({ className = "", to = "/" }: BrandLogoProps) {

  return (

    <Link to={to} className={`group inline-flex items-center gap-2 ${className}`}>

      <span

        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30"

        aria-hidden

      >

        <HubIcon name="songs" size={ICON_SIZE.md} strokeWidth={2.5} className="text-white" />

      </span>

      <span className="text-lg font-bold tracking-tight">

        <span className="text-white">{APP_NAME.slice(0, 6)}</span>

        <span className="text-blue-400">{APP_NAME.slice(6)}</span>

      </span>

    </Link>

  );

}

