import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StudentForm from './StudentForm';

interface Student {
  id: string;
  name: string;
  matricula: string;
  email: string;
  birth_date: string;
  created_at: string;
}

interface StudentTableProps {
  students: Student[];
  onRefresh: () => void;
}

const StudentTable = ({ students, onRefresh }: StudentTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    
    setDeletingId(selectedStudent.id);

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', selectedStudent.id);

      if (error) throw error;

      toast({
        title: 'Aluno removido!',
        description: 'O aluno foi excluído com sucesso.',
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao excluir o aluno.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setIsDeleteOpen(false);
      setSelectedStudent(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Data de Nascimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum aluno cadastrado
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.matricula}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{formatDate(student.birth_date)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(student)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(student)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(student)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <StudentForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        student={selectedStudent}
        onSuccess={onRefresh}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o aluno <strong>{selectedStudent?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingId}
            >
              {deletingId ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedStudent && (
        <AlertDialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Detalhes do Aluno</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-base">{selectedStudent.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matrícula</p>
                <p className="text-base">{selectedStudent.matricula}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{selectedStudent.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                <p className="text-base">{formatDate(selectedStudent.birth_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                <p className="text-base">{formatDate(selectedStudent.created_at)}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsViewOpen(false)}>
                Fechar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default StudentTable;
