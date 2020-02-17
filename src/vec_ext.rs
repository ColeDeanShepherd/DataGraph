pub trait VecExt<T> {
    fn remove_first<P>(&mut self, predicate: P) -> Option<T>
    where
        P: FnMut(&T) -> bool;
}

impl<T> VecExt<T> for Vec<T> {
    #[inline]
    fn remove_first<P>(&mut self, predicate: P) -> Option<T>
    where
        P: FnMut(&T) -> bool,
    {
        let index = self.iter().position(predicate);
        match index {
            Some(i) => Some(self.remove(i)),
            None => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_remove_first() {
        // Arrange
        let mut v = vec![1, 2, 3, 4];

        // Act
        let removed = v.remove_first(|&x| x == 3);

        // Assert
        assert_eq!(removed, Some(3));
    }

    #[test]
    fn test_bad_remove_first() {
        // Arrange
        let mut v = vec![1, 2, 3, 4];

        // Act
        let removed = v.remove_first(|&x| x == 5);

        // Assert
        assert_eq!(removed, None);
    }
}
