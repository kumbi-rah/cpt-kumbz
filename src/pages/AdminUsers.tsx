import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { UsersThree } from "@phosphor-icons/react";

interface UserRecord {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  email_confirmed_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export default function AdminUsers() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin || adminLoading) return;
    fetchUsers();
  }, [isAdmin, adminLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users");
      if (error) throw error;
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-georgia italic text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen pb-nav">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
            <UsersThree size={24} weight="duotone" className="text-amber" />
          </div>
          <div>
            <h1 className="font-georgia text-2xl font-bold text-ink">Manage Users</h1>
            <p className="text-sm text-muted-foreground">{users.length} registered users</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-destructive">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Signed Up</TableHead>
                  <TableHead className="hidden md:table-cell">Last Sign In</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-amber/10 text-amber">
                            {(u.display_name || u.email || "?")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm text-ink truncate max-w-[120px]">
                          {u.display_name || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[180px]">{u.email}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "MMM d, yyyy") : "Never"}
                    </TableCell>
                    <TableCell>
                      {u.email_confirmed_at ? (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 bg-green-500/10">
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-amber/30 text-amber bg-amber/10">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
