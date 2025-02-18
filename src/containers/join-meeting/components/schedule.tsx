import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Input } from "@/components/ui";
import { CalendarClockIcon } from "lucide-react";
import { useState } from "react";

type Props = {
    onScheduleMeetRoom: () => void
}

export const ScheduleButton: React.FC<Props> = ({ onScheduleMeetRoom }) => {
    const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [participants, setParticipants] = useState('');
    return (
        <Dialog open={openScheduleDialog} onOpenChange={setOpenScheduleDialog}>
            <DialogTrigger asChild>
                <Button
                    className="h-full w-full justify-start p-0 font-normal"
                    variant="ghost"
                    onClick={(e) => {
                        e.preventDefault();
                        setOpenScheduleDialog(true);
                    }}
                >
                    <CalendarClockIcon />
                    Schedule in Google Calendar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Meeting</DialogTitle>
                    <DialogDescription>
                        Set up your meeting time and invite participants
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="start-time">Start Time</label>
                        <Input
                            id="start-time"
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="end-time">End Time</label>
                        <Input
                            id="end-time"
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="participants">Participants (comma separated emails)</label>
                        <Input
                            id="participants"
                            type="text"
                            placeholder="email1@example.com, email2@example.com"
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenScheduleDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            // const participantsList = participants.split(',').map(email => ({
                            //     email: email.trim()
                            // }));
                            // scheduleHandler(startTime, endTime, meetingLink, participantsList)
                            //     .then((response) => {
                            //         if (response.success) {
                            //             setOpenScheduleDialog(false);

                            //         } else {
                            //             alert(`Error: ${response.error}`);
                            //         }
                            //     });
                        }}>
                            Schedule
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}