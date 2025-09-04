import UserProfile from '@/components/dashboard/user-profile'

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <UserProfile />
    </div>
  )
}

export const metadata = {
  title: 'Profile Settings | WorldWeaver',
  description: 'Manage your WorldWeaver account settings',
}
