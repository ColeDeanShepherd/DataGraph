use std::iter::Iterator;

pub trait VecExt<T> {
    fn remove_first<P>(&mut self, predicate: P) -> Option<T> where P: FnMut(&T) -> bool;
}

impl<T> VecExt<T> for Vec<T> {
    #[inline]
    fn remove_first<P>(&mut self, predicate: P) -> Option<T>
    where P: FnMut(&T) -> bool
    {
        let index = self.iter().position(predicate);
        match index {
            Some(i) => Some(self.remove(i)),
            None => None,
        }
    }
}

#[derive(Debug)]
struct State {
    todos: Vec<ToDo>,
    next_id: u64
}

impl State {
    fn new() -> State {
        State { todos: Vec::new(), next_id: 1 }
    }
}

#[derive(Debug)]
struct ToDo {
    id: u64,
    description: String,
    done: bool
}

impl State {
    pub fn add_todo(&mut self, mut todo: ToDo) {
        todo.id = self.next_id;
        self.next_id += 1;
        self.todos.push(todo);
    }
    pub fn remove_todo(&mut self, id: u64) -> Option<ToDo> {
        self.todos.remove_first(|t| t.id == id)
    }
    pub fn complete_todo(&mut self, id: u64) -> Result<(), &str> {
        let todo = self.todos.iter_mut().find(|t| t.id == id);
        match todo {
            Some(t) => {
                t.done = true;
                Ok(())
            },
            None => Err("Nonexistent todo")
        }
    }
    pub fn uncomplete_todo(&mut self, id: u64) -> Result<(), &str> {
        let todo = self.todos.iter_mut().find(|t| t.id == id);
        match todo {
            Some(t) => {
                t.done = false;
                Ok(())
            },
            None => Err("Nonexistent todo")
        }
    }
}

fn main() {
    let mut state = State::new();

    state.add_todo(ToDo { id: 0, description: String::from("todo 1"), done: false });
    state.add_todo(ToDo { id: 0, description: String::from("todo 2"), done: true });
    state.add_todo(ToDo { id: 0, description: String::from("todo 3"), done: true });

    state.complete_todo(1).unwrap();
    state.uncomplete_todo(2).unwrap();

    let x = state.remove_todo(3);

    println!("{:?}", state);
    println!("{:?}", x);
}