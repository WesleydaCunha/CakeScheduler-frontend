"use client";

import * as React from "react";
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import {
    DayPicker,
    DayPickerSingleProps,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TimePickerInput } from "../custom/time-picker-input";
import { ptBR } from "date-fns/locale";

export type DatetimePickerProps = Omit<
    DayPickerSingleProps,
    "mode" | "onSelect"
> & {
    setDate: (date: Date) => void;
};

function DatetimePicker({
    className,
    classNames,
    showOutsideDays = true,
    setDate: setGlobalDate,
    ...props
}: DatetimePickerProps) {
    const minuteRef = React.useRef<HTMLInputElement>(null);
    const hourRef = React.useRef<HTMLInputElement>(null);
    const { selected: selectedDate } = props as { selected: Date };

    const setDate = (dateInput: Date) => {
        const date = new Date(selectedDate);
        date.setDate(dateInput.getDate());
        date.setMonth(dateInput.getMonth());
        date.setFullYear(dateInput.getFullYear());
        setGlobalDate(date);
    };

    const setTime = (dateInput: Date | undefined) => {
        if (!dateInput) return;
        const time = new Date(selectedDate);
        time.setHours(dateInput.getHours());
        time.setMinutes(dateInput.getMinutes());
        setGlobalDate(time);
    };

    const increaseHours = () => {
        const currentHours = selectedDate.getHours();
        const newDate = new Date(selectedDate);
        newDate.setHours(currentHours + 1);
        setGlobalDate(newDate);
    };

    const decreaseHours = () => {
        const currentHours = selectedDate.getHours();
        const newDate = new Date(selectedDate);
        newDate.setHours(currentHours - 1);
        setGlobalDate(newDate);
    };

    const increaseMinutes = () => {
        const currentMinutes = selectedDate.getMinutes();
        const newDate = new Date(selectedDate);
        newDate.setMinutes(currentMinutes + 1);
        setGlobalDate(newDate);
    };

    const decreaseMinutes = () => {
        const currentMinutes = selectedDate.getMinutes();
        const newDate = new Date(selectedDate);
        newDate.setMinutes(currentMinutes - 1);
        setGlobalDate(newDate);
    };

    return (
        <>  
            <div className="flex justify-center items-center">
            <DayPicker
                locale={ptBR}
                mode="single"
                selected={selectedDate}
                onSelect={setDate as any}
                showOutsideDays={showOutsideDays}
                className={cn("py-3", className)}
                classNames={{
                    months:
                        "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                        buttonVariants({ variant: "outline" }),
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                        "text-muted-foreground rounded-md w-11 font-normal text-[0.9rem]",
                    row: "flex w-full",
                    cell: "h-11 w-11 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-11 w-11 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_range_end: "day-range-end",
                    day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside:
                        "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                        "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                    ...classNames,
                }}
                components={{
                    Footer: () => {
                        return <div></div>;
                    },
                    IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                    IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                }}
                {...props}
            />
            </div>
            <hr className="my-0" />
            <div className="px-2 mt-4 flex justify-between">
                <div className="flex gap-2 items-center text-gray-700">
                    <Clock className="h-5 w-5" />
                    <p className="text-sm font-medium">Horário</p>
                </div>
                <div className="font-medium">
                    <div className="flex items-center gap-2">
                        <div className="relative flex flex-col items-center">
                            <ChevronUp
                                className=" hover:text-blue-600 cursor-pointer"
                                onClick={increaseHours}
                            />
                            <TimePickerInput
                                picker="hours"
                                date={selectedDate}
                                setDate={setTime}
                                ref={hourRef}
                                onRightFocus={() => minuteRef.current?.focus()}
                            />
                            <ChevronDown
                                className=" hover:text-blue-600 cursor-pointer"
                                onClick={decreaseHours}
                            />
                        </div>
                        <span>:</span>
                        <div className="relative flex flex-col items-center">
                            <ChevronUp
                                className=" hover:text-blue-600 cursor-pointer"
                                onClick={increaseMinutes}
                            />
                            <TimePickerInput
                                picker="minutes"
                                date={selectedDate}
                                setDate={setTime}
                                ref={minuteRef}
                                onLeftFocus={() => hourRef.current?.focus()}
                            />
                            <ChevronDown
                                className="hover:text-blue-600 cursor-pointer"
                                onClick={decreaseMinutes}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

DatetimePicker.displayName = "DatetimePicker";

export { DatetimePicker };
