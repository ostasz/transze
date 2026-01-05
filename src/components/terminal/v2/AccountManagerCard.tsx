
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, User, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AccountManagerCard() {
    // In real app, fetch from session/user/organization
    const manager = {
        name: "Anna Nowak",
        role: "Senior Key Account Manager",
        phone: "+48 600 123 456",
        email: "anna.nowak@ekovoltis.pl",
        imageUrl: "/avatars/anna-nowak.jpg" // Placeholder
    };

    return (
        <Card className="bg-white shadow-sm border overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400" />
            <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                    <CardTitle className="text-sm font-bold text-gray-900">Twój Opiekun</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={manager.imageUrl} alt={manager.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">AN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{manager.name}</span>
                        <span className="text-xs text-muted-foreground">{manager.role}</span>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs bg-gray-50 border-gray-200">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span className="font-medium text-gray-700">{manager.phone}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs bg-gray-50 border-gray-200">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="truncate font-medium text-gray-700">{manager.email}</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
