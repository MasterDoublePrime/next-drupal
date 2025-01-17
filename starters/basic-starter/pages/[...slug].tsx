import * as React from "react"
import Head from "next/head"
import {
  DrupalNode,
  getPathsFromContext,
  getResourceFromContext,
  getResourceTypeFromContext,
	getResourceCollection,
} from "next-drupal"
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from "next"
import { NodeArticle } from "@/components/node-article"
import { NodeBasicPage } from "@/components/node-basic-page"
import { NodeProduct } from "@/components/node-product"
import { NodeMpp } from "@/components/node-mpp"
import { DrupalJsonApiParams } from "drupal-jsonapi-params"

interface NodePageProps {
  preview: GetStaticPropsContext["preview"]
  node: DrupalNode
}

export default function NodePage({ node, preview }: NodePageProps) {
  const [showPreviewAlert, setShowPreviewAlert] = React.useState<boolean>(false)

  if (!node) return null

  React.useEffect(() => {
    setShowPreviewAlert(preview && window.top === window.self)
  }, [])

  return (
    <>
      <Head>
        <title>{node.title}</title>
        <meta
          name="description"
          content="A Next.js site powered by a Drupal backend."
        />
      </Head>
      {showPreviewAlert && (
        <div className="fixed top-4 right-4">
          <a
            href="/api/exit-preview"
            className="bg-black text-white rounded-md px-4 py-2 text-sm"
          >
            Exit preview
          </a>
        </div>
      )}
      {node.type === "node--page" && <NodeBasicPage node={node} />}
      {node.type === "node--article" && <NodeArticle node={node} />}
      {node.type === "node--product" && <NodeProduct node={node} />}
      {node.type === "node--mpp" && <NodeMpp node={node} />}
    </>
  )
}

export async function getStaticPaths(context): Promise<GetStaticPathsResult> {
  return {
    paths: await getPathsFromContext(
      ["node--article", "node--page", "node--product"],
      context
    ),
    fallback: "blocking",
  }
}

export async function getStaticProps(
  context
): Promise<GetStaticPropsResult<NodePageProps>> {
  const type = await getResourceTypeFromContext(context)
  const params = new DrupalJsonApiParams()

  if (!type) {
    return {
      notFound: true,
    }
  }

  if (type === "node--article") {
    params.addFields("node--article", ["field_image", "uid"])
  }
  if (type === "node--product") {
    params.addFields("node--product", ["title", "body", "field_product_id"])
  }
  if (type === "node--mpp") {
    params.addFields("node--mpp", ["title", "body", "field_category_id"])
  }

  const node = await getResourceFromContext(type, context, {
    params: { ...params.getQueryObject(), include: 'field_product' },
  }) 
  if (!node?.status) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      preview: context.preview || false,
      node,
    },
    revalidate: 10,
  }
}
