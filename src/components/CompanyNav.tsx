"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {IconCaretDownFilled} from '@tabler/icons-react';

const navLinks = [
    { href: "/dashboard", label: "Control Panel" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/online-orders", label: "Online Orders" },
];

function CompanyNav() {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const activeLink = navLinks.find(link => link.href === pathname);

    return (
        <div className='p-2'>
            {/* Mobile Nav */}
            <div className='md:hidden'>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className='w-full p-2 border rounded-lg text-left font-semibold cursor-pointer'
                >
                    <div className='flex items-center justify-between gap-2'> 
                        {activeLink ? activeLink.label : "Dashboard Menu"}
                        <IconCaretDownFilled className='' size={20} />
                    </div>
                </button>
                {isDropdownOpen && (
                    <div className='absolute z-10 mt-1 w-50 sm:w-100 bg-white dark:bg-gray-800 border-2 rounded-lg shadow-lg'>
                        <nav className='flex flex-col p-1 gap-1'>
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsDropdownOpen(false)}
                                    className={`p-2 rounded-lg ${pathname === link.href ? "bg-green-300 dark:bg-green-800" : "dark:hover:bg-green-950 hover:bg-green-200"}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            {/* Desktop Nav */}
            <nav className='hidden md:flex justify-around items-center border-2 rounded-xl gap-5 p-1'>
                {navLinks.map(link => (
                    <div key={link.href} className={`p-2 rounded-full 
                        ${pathname === link.href && "bg-green-300 dark:bg-green-800"}`}>
                        <Link href={link.href} className={`dark:hover:bg-green-800 hover:bg-green-300 rounded-lg p-2`}>
                            {link.label}
                        </Link>
                    </div>
                ))}
            </nav>
        </div>
    )
}

export default CompanyNav;