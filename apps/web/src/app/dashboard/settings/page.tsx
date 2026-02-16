"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

type SettingCategory = "general" | "payment" | "shipping" | "email" | "advanced";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingCategory>("general");
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery(
        orpc.admin.settings.getAll.queryOptions({})
    );

    const { mutateAsync: updateSettings, isPending: isSaving } = useMutation({
        mutationFn: (data: { settings: Array<{ key: string; value: any }> }) =>
            client.admin.settings.updateMultiple(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.settings.getAll.queryKey({}) });
            toast.success("Settings saved successfully");
            setHasChanges(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to save settings");
        },
    });

    // Initialize form data from settings
    useEffect(() => {
        if (settings) {
            const initialData: Record<string, any> = {};
            settings.forEach((s: any) => {
                initialData[s.key] = s.value;
            });
            setFormData(initialData);
        }
    }, [settings]);

    const updateField = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
            key,
            value,
        }));
        await updateSettings({ settings: settingsToUpdate });
    };

    // Warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasChanges]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading settings...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingCategory)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping & Tax</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                            <CardDescription>Basic information about your store</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Store Name</Label>
                                <Input
                                    value={formData.store_name || ""}
                                    onChange={(e) => updateField("store_name", e.target.value)}
                                    placeholder="My Store"
                                />
                            </div>
                            <div>
                                <Label>Tagline</Label>
                                <Input
                                    value={formData.store_tagline || ""}
                                    onChange={(e) => updateField("store_tagline", e.target.value)}
                                    placeholder="Best products at best prices"
                                />
                            </div>
                            <div>
                                <Label>Store Email</Label>
                                <Input
                                    type="email"
                                    value={formData.store_email || ""}
                                    onChange={(e) => updateField("store_email", e.target.value)}
                                    placeholder="contact@store.com"
                                />
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <Input
                                    value={formData.store_phone || ""}
                                    onChange={(e) => updateField("store_phone", e.target.value)}
                                    placeholder="+234 XXX XXX XXXX"
                                />
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Textarea
                                    value={formData.store_address || ""}
                                    onChange={(e) => updateField("store_address", e.target.value)}
                                    placeholder="123 Main Street, City, Country"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Currency & Locale</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Currency Symbol</Label>
                                <Input
                                    value={formData.currency_symbol || "₦"}
                                    onChange={(e) => updateField("currency_symbol", e.target.value)}
                                    placeholder="₦"
                                    maxLength={5}
                                />
                            </div>
                            <div>
                                <Label>Currency Code</Label>
                                <Input
                                    value={formData.currency_code || "NGN"}
                                    onChange={(e) => updateField("currency_code", e.target.value)}
                                    placeholder="NGN"
                                    maxLength={3}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>Enable or disable payment options</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Bank Transfer</Label>
                                    <p className="text-sm text-muted-foreground">Allow customers to pay via bank transfer</p>
                                </div>
                                <Switch
                                    checked={formData.payment_bank_transfer_enabled ?? true}
                                    onCheckedChange={(v) => updateField("payment_bank_transfer_enabled", v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Cash on Delivery</Label>
                                    <p className="text-sm text-muted-foreground">Allow cash on delivery payments</p>
                                </div>
                                <Switch
                                    checked={formData.payment_cod_enabled ?? true}
                                    onCheckedChange={(v) => updateField("payment_cod_enabled", v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bank Account Details</CardTitle>
                            <CardDescription>Show these details for bank transfers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Bank Name</Label>
                                <Input
                                    value={formData.bank_name || ""}
                                    onChange={(e) => updateField("bank_name", e.target.value)}
                                    placeholder="First Bank"
                                />
                            </div>
                            <div>
                                <Label>Account Number</Label>
                                <Input
                                    value={formData.bank_account_number || ""}
                                    onChange={(e) => updateField("bank_account_number", e.target.value)}
                                    placeholder="0123456789"
                                />
                            </div>
                            <div>
                                <Label>Account Name</Label>
                                <Input
                                    value={formData.bank_account_name || ""}
                                    onChange={(e) => updateField("bank_account_name", e.target.value)}
                                    placeholder="Store Name Ltd"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Free Shipping</Label>
                                    <p className="text-sm text-muted-foreground">Enable free shipping option</p>
                                </div>
                                <Switch
                                    checked={formData.shipping_free_enabled ?? false}
                                    onCheckedChange={(v) => updateField("shipping_free_enabled", v)}
                                />
                            </div>
                            <div>
                                <Label>Free Shipping Threshold (₦)</Label>
                                <Input
                                    type="number"
                                    value={formData.shipping_free_threshold || ""}
                                    onChange={(e) => updateField("shipping_free_threshold", parseInt(e.target.value) || 0)}
                                    placeholder="50000"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Orders above this value get free shipping
                                </p>
                            </div>
                            <div>
                                <Label>Default Shipping Fee (₦)</Label>
                                <Input
                                    type="number"
                                    value={formData.shipping_default_fee || ""}
                                    onChange={(e) => updateField("shipping_default_fee", parseInt(e.target.value) || 0)}
                                    placeholder="2000"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tax Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Enable Tax</Label>
                                    <p className="text-sm text-muted-foreground">Apply tax to orders</p>
                                </div>
                                <Switch
                                    checked={formData.tax_enabled ?? false}
                                    onCheckedChange={(v) => updateField("tax_enabled", v)}
                                />
                            </div>
                            <div>
                                <Label>Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    value={formData.tax_rate || ""}
                                    onChange={(e) => updateField("tax_rate", parseFloat(e.target.value) || 0)}
                                    placeholder="7.5"
                                    step="0.1"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription>Configure when to send emails</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Order Confirmation</Label>
                                    <p className="text-sm text-muted-foreground">Send email when order is placed</p>
                                </div>
                                <Switch
                                    checked={formData.email_order_confirmation ?? true}
                                    onCheckedChange={(v) => updateField("email_order_confirmation", v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Order Shipped</Label>
                                    <p className="text-sm text-muted-foreground">Send email when order is shipped</p>
                                </div>
                                <Switch
                                    checked={formData.email_order_shipped ?? true}
                                    onCheckedChange={(v) => updateField("email_order_shipped", v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Payment Confirmed</Label>
                                    <p className="text-sm text-muted-foreground">Send email when payment is confirmed</p>
                                </div>
                                <Switch
                                    checked={formData.email_payment_confirmed ?? true}
                                    onCheckedChange={(v) => updateField("email_payment_confirmed", v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Admin Email</Label>
                                <Input
                                    type="email"
                                    value={formData.admin_notification_email || ""}
                                    onChange={(e) => updateField("admin_notification_email", e.target.value)}
                                    placeholder="admin@store.com"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Receive notifications about new orders
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Store Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">Hide store from customers</p>
                                </div>
                                <Switch
                                    checked={formData.maintenance_mode ?? false}
                                    onCheckedChange={(v) => updateField("maintenance_mode", v)}
                                />
                            </div>
                            <div>
                                <Label>Maintenance Message</Label>
                                <Textarea
                                    value={formData.maintenance_message || ""}
                                    onChange={(e) => updateField("maintenance_message", e.target.value)}
                                    placeholder="We're currently under maintenance. We'll be back soon!"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO & Social</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Meta Description</Label>
                                <Textarea
                                    value={formData.seo_meta_description || ""}
                                    onChange={(e) => updateField("seo_meta_description", e.target.value)}
                                    placeholder="Your store description for search engines"
                                    rows={2}
                                    maxLength={160}
                                />
                            </div>
                            <div>
                                <Label>Instagram URL</Label>
                                <Input
                                    value={formData.social_instagram || ""}
                                    onChange={(e) => updateField("social_instagram", e.target.value)}
                                    placeholder="https://instagram.com/yourstore"
                                />
                            </div>
                            <div>
                                <Label>Twitter/X URL</Label>
                                <Input
                                    value={formData.social_twitter || ""}
                                    onChange={(e) => updateField("social_twitter", e.target.value)}
                                    placeholder="https://x.com/yourstore"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
