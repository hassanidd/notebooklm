import { useState } from "react";
import Topbar from "@/components/app/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Cpu, Box, Layers, Shield, Bell, RefreshCw, Save } from "lucide-react";

const SETTING_TABS = [
  { id: "models", label: "Embedding Models", icon: Cpu },
  { id: "chunking", label: "Chunking", icon: Layers },
  { id: "vector-store", label: "Vector Store", icon: Box },
  { id: "ingestion", label: "Ingestion Defaults", icon: RefreshCw },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Settings" />

      <main className="flex-1 p-6">
        <Tabs defaultValue="models" orientation="vertical">
          <div className="flex gap-6">
            {/* Sidebar nav */}
            <div className="w-52 flex-shrink-0">
              <TabsList className="flex flex-col h-auto bg-white border border-gray-100 shadow-sm rounded-2xl p-2 gap-0.5 w-full">
                {SETTING_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full justify-start gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <TabsContent value="models" className="mt-0">
                <SettingsSection title="Embedding Models" description="Configure which embedding model is used for generating chunk vectors.">
                  <SettingRow label="Default Embedding Model" description="Used for all ingestions unless overridden per-dataset">
                    <Select defaultValue="3-large">
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-large">text-embedding-3-large (3072d)</SelectItem>
                        <SelectItem value="3-small">text-embedding-3-small (1536d)</SelectItem>
                        <SelectItem value="ada-002">text-embedding-ada-002 (1536d)</SelectItem>
                        <SelectItem value="custom">Custom model endpoint</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Custom Model Endpoint" description="Optional: bring your own embedding API">
                    <Input placeholder="https://your-api.com/embeddings" className="w-72" />
                  </SettingRow>
                  <SettingRow label="Batch Size" description="Number of chunks to embed per API call">
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SaveButton />
                </SettingsSection>
              </TabsContent>

              <TabsContent value="chunking" className="mt-0">
                <SettingsSection title="Chunking Defaults" description="Set the default chunking strategy applied to all ingestions.">
                  <SettingSlider label="Default Chunk Size (tokens)" description="Recommended: 256–1024" min={64} max={2048} defaultValue={512} />
                  <SettingSlider label="Default Overlap (tokens)" description="Amount of token overlap between adjacent chunks" min={0} max={512} defaultValue={64} />
                  <SettingRow label="Default Chunking Strategy" description="How to split documents into chunks">
                    <Select defaultValue="recursive">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recursive">Recursive character</SelectItem>
                        <SelectItem value="sentence">Sentence boundary</SelectItem>
                        <SelectItem value="semantic">Semantic (slow)</SelectItem>
                        <SelectItem value="fixed">Fixed token count</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Run OCR by default" description="Apply OCR to image-heavy pages automatically">
                    <Switch defaultChecked />
                  </SettingRow>
                  <SettingRow label="Extract tables by default" description="Parse tabular content as separate table chunks">
                    <Switch defaultChecked />
                  </SettingRow>
                  <SaveButton />
                </SettingsSection>
              </TabsContent>

              <TabsContent value="vector-store" className="mt-0">
                <SettingsSection title="Vector Store Configuration" description="Configure the vector database where embeddings are indexed.">
                  <SettingRow label="Vector Store Provider" description="Where to store and retrieve embeddings">
                    <Select defaultValue="pinecone">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pinecone">Pinecone</SelectItem>
                        <SelectItem value="qdrant">Qdrant</SelectItem>
                        <SelectItem value="weaviate">Weaviate</SelectItem>
                        <SelectItem value="chroma">Chroma</SelectItem>
                        <SelectItem value="pgvector">pgvector (Postgres)</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Index / Namespace" description="Target index in the vector store">
                    <Input placeholder="prod-knowledge-base" className="w-64" defaultValue="prod-knowledge-base" />
                  </SettingRow>
                  <SettingRow label="API Key" description="Authentication for the vector store API">
                    <Input type="password" defaultValue="••••••••••••••••" className="w-64" />
                  </SettingRow>
                  <div className="pt-4 flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm text-emerald-700 font-medium">Connected to Pinecone — prod-knowledge-base</span>
                    <Button size="sm" variant="outline" className="ml-auto">Test Connection</Button>
                  </div>
                  <SaveButton />
                </SettingsSection>
              </TabsContent>

              <TabsContent value="ingestion" className="mt-0">
                <SettingsSection title="Ingestion Defaults" description="Configure default behavior for Auto and Guided mode ingestions.">
                  <SettingRow label="Default Ingestion Mode" description="Mode selected by default on the New Ingestion page">
                    <Select defaultValue="auto">
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto Mode</SelectItem>
                        <SelectItem value="guided">Guided Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Default Embedding Strategy" description="Embed representation used unless overridden">
                    <Select defaultValue="normalized">
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw">Raw</SelectItem>
                        <SelectItem value="normalized">Normalized</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Auto-retry on failure" description="Automatically retry failed ingestion steps">
                    <Switch defaultChecked />
                  </SettingRow>
                  <SettingRow label="Retry Attempts" description="Max retries before marking as failed">
                    <Select defaultValue="3">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SaveButton />
                </SettingsSection>
              </TabsContent>

              <TabsContent value="permissions" className="mt-0">
                <SettingsSection title="Permission Defaults" description="Set default visibility and access control for new datasets and documents.">
                  <SettingRow label="Default Dataset Visibility" description="Applied when creating new datasets">
                    <Select defaultValue="team">
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingRow>
                  <SettingRow label="Default Allowed Groups" description="Groups with read access to newly created datasets">
                    <Input defaultValue="engineering, data-team" className="w-72" />
                  </SettingRow>
                  <SettingRow label="Enable multi-tenant isolation" description="Enforce tenant_id filtering on all retrieval queries">
                    <Switch defaultChecked />
                  </SettingRow>
                  <SaveButton />
                </SettingsSection>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <SettingsSection title="Notifications" description="Configure when and how you receive ingestion alerts.">
                  <SettingRow label="Notify on completion" description="Send a notification when an ingestion completes">
                    <Switch defaultChecked />
                  </SettingRow>
                  <SettingRow label="Notify on failure" description="Send a notification when an ingestion fails">
                    <Switch defaultChecked />
                  </SettingRow>
                  <SettingRow label="Guided Mode approvals" description="Notify when a document is waiting for guided review">
                    <Switch defaultChecked />
                  </SettingRow>
                  <SettingRow label="Notification Email" description="Where to send alerts">
                    <Input defaultValue="alex.kim@acme.com" className="w-64" />
                  </SettingRow>
                  <SaveButton />
                </SettingsSection>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

function SettingsSection({
  title, description, children
}: {
  title: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="border-b border-gray-50 pb-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SettingRow({
  label, description, children
}: {
  label: string; description: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SettingSlider({
  label, description, min, max, defaultValue
}: {
  label: string; description: string; min: number; max: number; defaultValue: number
}) {
  const [value, setValue] = useState([defaultValue]);
  return (
    <div className="flex items-center justify-between gap-6 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-3 w-56 flex-shrink-0">
        <Slider
          value={value}
          onValueChange={setValue}
          min={min}
          max={max}
          step={32}
          className="flex-1"
        />
        <span className="text-sm font-medium text-gray-700 w-12 text-right">{value[0]}</span>
      </div>
    </div>
  );
}

function SaveButton() {
  return (
    <div className="pt-2 border-t border-gray-50 flex justify-end">
      <Button size="sm" className="gap-2">
        <Save className="size-4" />
        Save Changes
      </Button>
    </div>
  );
}
