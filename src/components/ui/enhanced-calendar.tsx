import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  enableYearMonthSelect?: boolean;
};

function EnhancedCalendar({ 
  className, 
  classNames, 
  showOutsideDays = true, 
  enableYearMonthSelect = false,
  ...props 
}: EnhancedCalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month || new Date());

  // Generate year options (from 1900 to current year + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 11 }, (_, i) => 1900 + i);
  
  // Month names in Indonesian
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handleMonthChange = (newMonth: string) => {
    const monthIndex = parseInt(newMonth);
    const newDate = new Date(month.getFullYear(), monthIndex, 1);
    setMonth(newDate);
  };

  const handleYearChange = (newYear: string) => {
    const year = parseInt(newYear);
    const newDate = new Date(year, month.getMonth(), 1);
    setMonth(newDate);
  };

  // Custom caption component with dropdowns
  const CustomCaption = enableYearMonthSelect ? ({ displayMonth }: { displayMonth: Date }) => {
    return (
      <div className="flex justify-center pt-1 relative items-center gap-2">
        <Select value={displayMonth.getMonth().toString()} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((monthName, index) => (
              <SelectItem key={index} value={index.toString()}>
                {monthName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={displayMonth.getFullYear().toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[100px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  } : undefined;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      month={month}
      onMonthChange={setMonth}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: enableYearMonthSelect ? "flex justify-center pt-1 relative items-center" : "flex justify-center pt-1 relative items-center",
        caption_label: enableYearMonthSelect ? "hidden" : "text-sm font-medium",
        nav: enableYearMonthSelect ? "hidden" : "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        ...(CustomCaption && { Caption: CustomCaption }),
      }}
      {...props}
    />
  );
}
EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };