import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import StudentTable from '@/components/StudentTable';
import StudentForm from '@/components/StudentForm';
import { GraduationCap, LogOut, Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  matricula: string;
  email: string;
  birth_date: string;
  created_at: string;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchStudents = async () => {
    if (!user) return;
    
    setIsLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStudents(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar alunos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Sistema de Gerenciamento</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Stats Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total de Alunos</p>
                  <p className="text-3xl font-bold">{students.length}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Alunos Cadastrados</CardTitle>
                  <CardDescription>Gerencie todos os alunos do sistema</CardDescription>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Aluno
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingStudents ? (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Carregando alunos...</p>
                </div>
              ) : (
                <StudentTable students={students} onRefresh={fetchStudents} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <StudentForm
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={fetchStudents}
      />
    </div>
  );
};

export default Index;
