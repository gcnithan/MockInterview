import React from 'react'
import Header from './_components/Header'

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header/>
            <div className='mx-5 md:mx-20 lg:mx-36 mt-6'>
                {children}
            </div>
        </div>
    );
}