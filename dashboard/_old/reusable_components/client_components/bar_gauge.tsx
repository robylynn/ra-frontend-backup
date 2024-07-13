// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

"use client";

import { useEffect, useRef, useState } from "react";

interface GaugeValueState {
  previous_value: number;
  current_value: number;
}

interface GaugeDimensions {
  pointer_intersection_percent: number;
  pointer_intersection_px: number;
  safe_zone_start_percent: number;
  safe_zone_length_percent: number;
  warning_zone_start_percent: number;
  warning_zone_length_percent: number;
  danger_zone_start_percent: number;
  danger_zone_length_percent: number;
  active_safe_zone_length_percent: number;
  active_warning_zone_length_percent: number;
  active_danger_zone_length_percent: number;
}

export function SVGGauge(props: {
  id: string;
  title: string;
  value: number;
  minimum: number;
  maximum: number;
  warning_threshold: number;
  danger_threshold: number;
  height: number;
  gauge_colors_reversed: boolean;
}) {
  const pointer_altitude_px = 10;
  const pointer_halfwidth_px = pointer_altitude_px / Math.sqrt(3);
  const x_padding_percent = 4;
  const y_padding_px = 4;
  const bar_height_px = props.height - pointer_altitude_px - 2 * y_padding_px;
  const animation_duration_sec = 0.5;
  const animation_duration_string = `${animation_duration_sec}s`;

  const calculate_gauge_dimensions = (value: number): GaugeDimensions => {
    const clipped_value =
      value < props.minimum
        ? props.minimum
        : value > props.maximum
        ? props.maximum
        : value;

    const pointer_intersection_percent =
      ((clipped_value - props.minimum) / (props.maximum - props.minimum)) *
        (100 - 2 * x_padding_percent) +
      x_padding_percent;
    const pointer_intersection_px =
      (pointer_intersection_percent * svg_width) / 100;

    const safe_zone_start_percent = x_padding_percent;
    const safe_zone_length_percent =
      ((props.warning_threshold - props.minimum) /
        (props.maximum - props.minimum)) *
      (100 - 2 * x_padding_percent); // * props.width;

    const active_safe_zone_length_percent = () => {
      if (clipped_value >= props.warning_threshold)
        return safe_zone_length_percent;
      else
        return (
          ((clipped_value - props.minimum) /
            (props.warning_threshold - props.minimum)) *
          safe_zone_length_percent
        );
    };

    const warning_zone_start_percent =
      safe_zone_start_percent + safe_zone_length_percent;
    const warning_zone_length_percent =
      ((props.danger_threshold - props.warning_threshold) /
        (props.maximum - props.minimum)) *
      (100 - 2 * x_padding_percent); // * props.width;
    const active_warning_zone_length_percent = () => {
      if (clipped_value >= props.danger_threshold)
        return warning_zone_length_percent;
      else if (clipped_value > props.warning_threshold)
        return (
          ((clipped_value - props.warning_threshold) /
            (props.danger_threshold - props.warning_threshold)) *
          warning_zone_length_percent
        );
      else return 0;
    };

    const danger_zone_start_percent =
      warning_zone_start_percent + warning_zone_length_percent;
    const danger_zone_length_percent =
      ((props.maximum - props.danger_threshold) /
        (props.maximum - props.minimum)) *
      (100 - 2 * x_padding_percent); // * props.width;
    const active_danger_zone_length_percent = () => {
      if (clipped_value > props.maximum) return danger_zone_length_percent;
      else if (clipped_value > props.danger_threshold)
        return (
          ((clipped_value - props.danger_threshold) /
            (props.maximum - props.danger_threshold)) *
          danger_zone_length_percent
        );
      else return 0;
    };

    return {
      pointer_intersection_percent: pointer_intersection_percent,
      pointer_intersection_px: pointer_intersection_px,
      safe_zone_start_percent: safe_zone_start_percent,
      safe_zone_length_percent: safe_zone_length_percent,
      warning_zone_start_percent: warning_zone_start_percent,
      warning_zone_length_percent: warning_zone_length_percent,
      danger_zone_start_percent: danger_zone_start_percent,
      danger_zone_length_percent: danger_zone_length_percent,
      active_safe_zone_length_percent: active_safe_zone_length_percent(),
      active_warning_zone_length_percent: active_warning_zone_length_percent(),
      active_danger_zone_length_percent: active_danger_zone_length_percent(),
    };
  };

  const [svg_width, setWidth] = useState(0);
  const svg_element = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setWidth(svg_element.current?.clientWidth as number);
  }, []);

  const [gaugeValueState, setGaugeValueState] = useState<GaugeValueState>({
    previous_value: 0,
    current_value: 0,
  });

  useEffect(() => {
    setGaugeValueState((state) => {
      return {
        previous_value: state.current_value,
        current_value: props.value,
      };
    });

    const animate_elements =
      svg_element.current?.getElementsByTagName("animate");
    if (animate_elements != undefined) {
      for (let i = 0; i < animate_elements?.length; i++) {
        const animate_element = animate_elements?.item(i);
        animate_element?.beginElement();
      }
    }
  }, [props.value]);

  const previous_gauge_dimensions = calculate_gauge_dimensions(
    gaugeValueState.previous_value,
  );
  const current_gauge_dimensions = calculate_gauge_dimensions(
    gaugeValueState.current_value,
  );

  const save_zone_inactive_color = "#063601";
  const warning_zone_inactive_color = "#736d00";
  const danger_zone_inactive_color = "#570101";

  const text_color = () => {
    // Used colors -- DO NOT DELETE
    // text-r2-green-500
    // text-r2-yellow-500
    // text-r2-red-300

    if (props.value < props.warning_threshold) return "r2-green-500";
    else if (props.value < props.danger_threshold) return "r2-yellow-500";
    else return "r2-red-300";
  };

  return (
    <div className="flex flex-col w-full pt-1">
      <p
        className={`font-bold text-sm px-[${x_padding_percent}%] px-[4%] text-r2-white m-0`}
      >
        {props.title}
      </p>
      <div className="flex flex-row items-center justify-start w-full h-full p-0">
        <svg ref={svg_element} width={"95%"} height={props.height}>
          {/* INACTIVE REGIONS */}
          <rect
            x={`${x_padding_percent}%`}
            y={y_padding_px}
            width={`${current_gauge_dimensions.safe_zone_length_percent}%`}
            height={bar_height_px}
            fill={save_zone_inactive_color}
            stroke={"white"}
            strokeWidth={2}
            rx={5}
          />
          <rect
            x={`${current_gauge_dimensions.warning_zone_start_percent}%`}
            y={y_padding_px}
            width={`${current_gauge_dimensions.warning_zone_length_percent}%`}
            height={bar_height_px}
            fill={warning_zone_inactive_color}
            stroke={"white"}
            strokeWidth={2}
            rx={5}
          />
          <rect
            x={`${current_gauge_dimensions.danger_zone_start_percent}%`}
            y={y_padding_px}
            width={`${current_gauge_dimensions.danger_zone_length_percent}%`}
            height={bar_height_px}
            fill={danger_zone_inactive_color}
            stroke={"white"}
            strokeWidth={2}
            rx={5}
          />

          {/* ACTIVE REGIONS */}
          <rect
            x={`${x_padding_percent}%`}
            y={y_padding_px}
            width={`${current_gauge_dimensions.active_safe_zone_length_percent}%`}
            height={bar_height_px}
            className="fill-r2-green-500"
            stroke={"white"}
            strokeWidth={2}
            rx={5}
          >
            <animate
              attributeName="width"
              from={`${previous_gauge_dimensions.active_safe_zone_length_percent}%`}
              to={`${current_gauge_dimensions.active_safe_zone_length_percent}%`}
              dur={animation_duration_string}
              fill={"freeze"}
            />
          </rect>
          <rect
            x={`${current_gauge_dimensions.warning_zone_start_percent}%`}
            y={y_padding_px}
            width={`${current_gauge_dimensions.active_warning_zone_length_percent}%`}
            height={bar_height_px}
            className="fill-r2-yellow-500"
            stroke={"white"}
            strokeWidth={2}
            rx={5}
          >
            <animate
              attributeName="width"
              from={`${previous_gauge_dimensions.active_warning_zone_length_percent}%`}
              to={`${current_gauge_dimensions.active_warning_zone_length_percent}%`}
              dur={animation_duration_string}
              fill={"freeze"}
            />
          </rect>
          <rect
            x={`${current_gauge_dimensions.danger_zone_start_percent}%`}
            y={y_padding_px}
            width={`${current_gauge_dimensions.active_danger_zone_length_percent}%`}
            height={bar_height_px}
            className="fill-r2-red-300"
            stroke={"white"}
            strokeWidth={2}
            rx={5}
          >
            <animate
              attributeName="width"
              from={`${previous_gauge_dimensions.active_danger_zone_length_percent}%`}
              to={`${current_gauge_dimensions.active_danger_zone_length_percent}%`}
              dur={animation_duration_string}
              fill={"freeze"}
            />
          </rect>
          <polygon
            points={`
                                ${
                                  current_gauge_dimensions.pointer_intersection_px
                                },${bar_height_px} 
                                ${
                                  current_gauge_dimensions.pointer_intersection_px +
                                  pointer_halfwidth_px
                                },${props.height - y_padding_px}
                                ${
                                  current_gauge_dimensions.pointer_intersection_px -
                                  pointer_halfwidth_px
                                },${props.height - y_padding_px}
                                `}
            fill={"white"}
            stroke={"white"}
            strokeWidth={5}
            strokeLinejoin={"round"}
          >
            <animate
              attributeName={"points"}
              from={`
                                    ${
                                      previous_gauge_dimensions.pointer_intersection_px
                                    },${bar_height_px} 
                                    ${
                                      previous_gauge_dimensions.pointer_intersection_px +
                                      pointer_halfwidth_px
                                    },${props.height - y_padding_px}
                                    ${
                                      previous_gauge_dimensions.pointer_intersection_px -
                                      pointer_halfwidth_px
                                    },${props.height - y_padding_px}
                                    `}
              to={`
                                    ${
                                      current_gauge_dimensions.pointer_intersection_px
                                    },${bar_height_px} 
                                    ${
                                      current_gauge_dimensions.pointer_intersection_px +
                                      pointer_halfwidth_px
                                    },${props.height - y_padding_px}
                                    ${
                                      current_gauge_dimensions.pointer_intersection_px -
                                      pointer_halfwidth_px
                                    },${props.height - y_padding_px}
                                    `}
              fill={"freeze"}
              dur={animation_duration_string}
              begin={"indefinite"}
            />
          </polygon>
          <line
            x1={`${current_gauge_dimensions.pointer_intersection_px}`}
            y1={y_padding_px}
            x2={`${current_gauge_dimensions.pointer_intersection_px}`}
            y2={bar_height_px}
            stroke={"white"}
            strokeWidth={5}
          >
            <animate
              attributeName="x1"
              from={`${previous_gauge_dimensions.pointer_intersection_px}`}
              to={`${current_gauge_dimensions.pointer_intersection_px}`}
              dur={animation_duration_string}
              repeatCount={1}
            />
            <animate
              attributeName="x2"
              from={`${previous_gauge_dimensions.pointer_intersection_px}`}
              to={`${current_gauge_dimensions.pointer_intersection_px}`}
              dur={animation_duration_string}
              repeatCount={1}
            />
          </line>
        </svg>
        <p className={`p-0 m-0 text-${text_color()}`}>{props.value}</p>
      </div>
    </div>
  );
}
