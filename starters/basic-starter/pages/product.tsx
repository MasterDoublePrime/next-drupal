import { getPathsFromContext, getResourceFromContext } from "next-drupal"

export default function ProductPage({ node }) {
  return (
    <article>
      <h1>{node.title}</h1>
      <p>Hi Mom</p>
    </article>
  )
}

export async function getStaticPaths(context) {
  // Build paths for all `node--product`.
  return {
    paths: await getPathsFromContext("node--product", context), // highlight-line
    fallback: false,
  }
}

export async function getStaticProps(context) {
  // Fetch the node based on the context.
  // next-drupal automatically handles the slug value.
  const node = await getResourceFromContext("node--product", context) // highlight-line

  return {
    props: {
      node,
    },
  }
}
