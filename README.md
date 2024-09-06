# Social API

Idea:

It is all about the posts. Maybe a post is actually a title and a description. It contains multiple optional relationships to different types of files: imgs, text, videos, audio. So a user creates a post and then select what type of file it attaches to it. In addition multiple categories may be selects.

Each type of content is a nest module and independent of everything else.

This way the API remains agnostic of the type of GUI, delegating the use case to the said frontend.

## Next Steps

Category CRUD + addCategoryToPOst + removeCategoryFromPost
