# Social API

Idea:

It is all about the posts. Maybe a post is actually a title and a description. It contains multiple optional relationships to different types of files: imgs, text, videos, audio. So a user creates a post and then select what type of file it attaches to it. In addition multiple categories may be selects.

Each type of content is a nest module and independent of everything else.

This way the API remains agnostic of the type of GUI, delegating the use case to the said frontend.

## Next Steps

### Users

1. Get, what do i get in a get request?
2. Update tests accordingly

### Posts

1. Now a user may have a post and a post belongs to a user.
2. Unit test the service CRUD.
3. Unit test the controller CRUD.
4. E2E tests of a user creating a post, restriction to a creation without auth, etc.

> Pensando en la jerarquía de los módulos y la independencia de los mismos WIP
Users <> Posts
Categories <>

### Categories

1. There is a many to many relationship to the posts.
2. Unit test the service CRUD.
3. Unit test the controller CRUD.
4. E2E the post creation with a category.
5. E2E fetch by category
6. E2E fetch posts with their corresponding category.

### Photos

Posts <-- Images

### Artivles

Posts <-- Articles
Images <--
