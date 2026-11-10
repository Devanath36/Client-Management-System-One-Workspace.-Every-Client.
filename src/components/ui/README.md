# Client Management System — Reusable UI Components

A collection of responsive, accessible React components styled with Tailwind CSS following the system's blue-and-white theme.

All components support dark mode automatically using Tailwind's `dark:` classes.

---

## 1. Button (`Button.tsx`)

A flexible button component with visual variants, sizes, icon slots, and built-in loading spinner states.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size and padding |
| `isLoading` | `boolean` | `false` | Displays spinner and disables interaction |
| `leftIcon` | `ReactNode` | `undefined` | Icon positioned before children |
| `rightIcon`| `ReactNode` | `undefined` | Icon positioned after children |

### Usage Example
```tsx
import { Button } from './components/ui';
import { ArrowRight, Plus } from 'lucide-react';

<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
  Add Client
</Button>

<Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />} isLoading={isSaving}>
  Save Changes
</Button>
```

---

## 2. Input (`Input.tsx`)

An enhanced input field supporting labels, error state display, helper text, prefix/suffix icons, and a built-in password show/hide toggle.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `undefined` | Input label text |
| `error` | `string` | `undefined` | Error message displayed below input |
| `helperText` | `string` | `undefined` | Descriptive helper text |
| `isPassword` | `boolean` | `false` | Enables password show/hide button |
| `leftIcon` | `ReactNode` | `undefined` | Icon inside the left edge of the input |
| `rightIcon` | `ReactNode` | `undefined` | Icon inside the right edge of the input |

### Usage Example
```tsx
import { Input } from './components/ui';
import { User, Lock } from 'lucide-react';

<Input
  label="Login ID or Corporate Email"
  placeholder="e.g. admin.sarah"
  leftIcon={<User className="w-4 h-4" />}
  value={loginId}
  onChange={(e) => setLoginId(e.target.value)}
  error={errors.loginId}
  required
/>

<Input
  label="Password"
  isPassword
  leftIcon={<Lock className="w-4 h-4" />}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={errors.password}
  required
/>
```

---

## 3. Select (`Select.tsx`)

A styled dropdown select component with custom arrow indicator, label, and validation state.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `undefined` | Select label text |
| `options` | `Array<{ value: string; label: string; disabled?: boolean }>` | `undefined` | Options list |
| `error` | `string` | `undefined` | Error message |
| `leftIcon` | `ReactNode` | `undefined` | Prefix icon |

### Usage Example
```tsx
import { Select } from './components/ui';

<Select
  label="Designated Role"
  value={selectedRole}
  onChange={(e) => setSelectedRole(e.target.value)}
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'team_member', label: 'Team Member' },
  ]}
/>
```

---

## 4. Textarea (`Textarea.tsx`)

A multi-line text input with auto-styled borders, focus rings, and validation messages.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | `undefined` | Textarea label text |
| `rows` | `number` | `3` | Number of visible rows |
| `error` | `string` | `undefined` | Error message |

### Usage Example
```tsx
import { Textarea } from './components/ui';

<Textarea
  label="Deliverable Notes"
  rows={4}
  placeholder="Provide details about the submitted deliverable proof..."
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>
```

---

## 5. Checkbox (`Checkbox.tsx`)

An accessible, custom-styled checkbox with checkmark animation and description text.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `ReactNode` | `undefined` | Primary checkbox label |
| `description` | `string` | `undefined` | Secondary helper description |

### Usage Example
```tsx
import { Checkbox } from './components/ui';

<Checkbox
  label="Send email notification"
  description="Notify assignee immediately upon task assignment"
  checked={notifyUser}
  onChange={(e) => setNotifyUser(e.target.checked)}
/>
```

---

## 6. Badge (`Badge.tsx`)

A compact status and label badge with color variants and optional indicator dot.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'blue' \| 'emerald' \| 'amber' \| 'rose' \| 'slate' \| 'indigo' \| 'purple'` | `'blue'` | Color theme |
| `dot` | `boolean` | `false` | Displays a status circle dot |

### Usage Example
```tsx
import { Badge } from './components/ui';

<Badge variant="emerald" dot>Active</Badge>
<Badge variant="amber" dot>Proof Review</Badge>
<Badge variant="blue">Administrator</Badge>
```

---

## 7. SummaryCard (`SummaryCard.tsx`)

A metric and summary KPI card ideal for dashboards, showing titles, primary values, optional trends, and icons.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Required | Metric title |
| `value` | `string \| number` | Required | Main metric value |
| `subtitle` | `string` | `undefined` | Footer subtitle |
| `icon` | `ReactNode` | `undefined` | Top-right icon container |
| `trend` | `{ value: string; isPositive?: boolean; label?: string }` | `undefined` | Percentage / trend metric |
| `badge` | `ReactNode` | `undefined` | Right-aligned badge pill |

### Usage Example
```tsx
import { SummaryCard, Badge } from './components/ui';
import { Users, Briefcase } from 'lucide-react';

<SummaryCard
  title="Provisioned Accounts"
  value="19"
  subtitle="All 4 roles active"
  icon={<Users className="w-4 h-4" />}
  badge={<Badge variant="blue">Verified</Badge>}
/>

<SummaryCard
  title="Active Projects"
  value="6"
  trend={{ value: "+12%", isPositive: true, label: "vs last month" }}
  icon={<Briefcase className="w-4 h-4" />}
/>
```

---

## 8. Modal (`Modal.tsx`)

An accessible, backdrop-blurred modal dialog with title, description, escape key listener, and actions footer.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | Required | Visibility state |
| `onClose` | `() => void` | Required | Close callback |
| `title` | `ReactNode` | Required | Dialog header title |
| `description` | `ReactNode` | `undefined` | Subtitle description |
| `icon` | `ReactNode` | `undefined` | Leading icon in header |
| `footer` | `ReactNode` | `undefined` | Bottom actions bar |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Width sizing |

### Usage Example
```tsx
import { Modal, Button } from './components/ui';
import { Shield } from 'lucide-react';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Provision New Employee"
  description="Add account credentials and configure designated role."
  icon={<Shield className="w-5 h-5" />}
  footer={
    <>
      <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Confirm</Button>
    </>
  }
>
  <form className="space-y-4">
    {/* Form inputs */}
  </form>
</Modal>
```
