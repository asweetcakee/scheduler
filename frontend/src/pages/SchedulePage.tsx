import { MasterScheduleRow } from '../components/masters/schedule/MasterScheduleRow'
import { useMasters } from '../hooks/masters'

export const SchedulePage = () => {
    const { data: masters, isLoading: isMastersLoading, error: mastersError } = useMasters()
    
    if (isMastersLoading) return <p>Loading masters...</p>
    if (mastersError) return <p>Error: {mastersError.message}</p>

    return(
        <section className='flex flex-col w-full'>
            <div className='flex justify-start items-center mx-6 mt-6 gap-2'>
                <div className='flex justify-center items-center px-3 py-2 rounded-lg border border-transparent focus-within:border-accent-purple bg-surface max-w-xs group'>
                    <input 
                        type='text'
                        placeholder='Поиск мастера...'
                        className='w-full outline-none'
                    />
                </div>
            </div>
            <div className='m-6 px-6 pb-6 overflow-x-auto bg-surface rounded-lg'>
                <table className='w-full table-fixed min-w-200'>
                    <colgroup>
                        <col className='w-[16%]' />
                        <col className='w-[12%]' />
                        <col className='w-[12%]' />
                        <col className='w-[12%]' />
                        <col className='w-[12%]' />
                        <col className='w-[12%]' />
                        <col className='w-[12%]' />
                        <col className='w-[12%]' />
                    </colgroup>
                    <thead>
                        <tr>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Мастер</th>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Пн</th>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Вт</th>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Ср</th>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Чт</th>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Пт</th>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Сб</th>
                            <th scope='col' className='px-2 py-3 font-bold uppercase text-text text-left'>Вс</th>
                        </tr>
                    </thead>
                    <tbody>
                        {masters?.map(master => (
                            <MasterScheduleRow 
                                key={master.id}
                                master={master}
                            />
                        ))}                    
                    </tbody>
                </table>
            </div>
        </section>
    )
}