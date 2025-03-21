import {
    NextAPIResponseInterface,
    UIConfiguration,
} from '@/lib/models/api_models';

export async function save_UI_configuration(configuration: UIConfiguration) {
    const serialized_configuration =
        configuration.serialize_saved_confiuration();

    console.log(`Saving configuration: ${serialized_configuration}`);

    const res: NextAPIResponseInterface = await fetch(
        'api/backend/ui/configuration',
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            body: serialized_configuration,
        }
    ).then((res) => res.json());

    return res;
}
