import { useFieldArray, useForm } from 'react-hook-form'
import type { ISODate } from '../../../schemas/scheduleSchema'
import type { CreateVersionBody } from '../../../types/schedule'

type VersionEditorProps = {
    initial: CreateVersionBody
    today: ISODate
    isPending: boolean
    serverError?: string
    submitLabel?: string
    onSubmit: (data: CreateVersionBody) => void
}

export const VersionEditor = ({
    initial,
    today,
    isPending,
    serverError,
    submitLabel = 'Сохранить',
    onSubmit
}: VersionEditorProps) => {
    const [formError, setFormError] = useState<string | null>(null)
    const { 
        register,
        control,
        handleSubmit,
        formState: { errors }
     } = useForm<CreateVersionBody>({
        defaultValues: initial
    })

    const { fields, append, remove } = useFieldArray({ 
        control,
        name: 'intervals'
    })

    const submit = (data: CreateVersionBody) => {
        const error = validateIntervals(data.intervals)
        setFormError(error)
        if (error) return
        onSubmit(data)
    }
}