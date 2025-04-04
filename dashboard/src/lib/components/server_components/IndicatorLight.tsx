export default function IndicatorLight(props: {active: boolean, on_color: string}) {
    return (
        <span className="rounded-full h-[50px] w-[50px]" style={{'background': props.active ? `${props.on_color}` : 'rgb(100,100,100,1)'}}/>
    )
}