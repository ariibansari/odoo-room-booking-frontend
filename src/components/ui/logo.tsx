
const Logo = () => {
    return (
        <div className='flex items-center gap-2'>
            <img src="./odoo.svg" alt="odoo" className='w-9' />

            <div className='flex flex-col mt-1'>
                <span className='text-sm font-medium text-primary/80 my-[-6px]'>Odoo</span>
                <p className='text-xl font-medium'>Room Booking</p>
            </div>
        </div>
    )
}

export default Logo